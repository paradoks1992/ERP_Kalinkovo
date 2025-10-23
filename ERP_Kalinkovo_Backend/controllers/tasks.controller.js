// controllers/tasks.controller.js
import { sql, connectToDb } from "../db.js";
import logger from "../logger.js";

const STOCK_CHECK_SOFT = true;

// helpers
async function getTaskById(pool, taskId) {
  const r = await pool
    .request()
    .input("taskId", sql.Int, taskId)
    .query(`
      SELECT
        t.id,
        t.created_by,
        t.assigned_to,
        CONVERT(NVARCHAR(32), t.status) AS status,
        CONVERT(NVARCHAR(16), t.operation_type) AS operation_type,
        t.product_id,
        t.from_storage_id,
        t.to_storage_id,
        t.quantity,
        CONVERT(NVARCHAR(MAX), t.comment) AS comment,
        t.created_at,
        t.updated_at
      FROM dbo.Tasks t
      WHERE t.id = @taskId
    `);
  return r.recordset[0] || null;
}

async function getRemainingQuantity(pool, taskId) {
  const r = await pool
    .request()
    .input("taskId", sql.Int, taskId)
    .query(`
      SELECT
        t.quantity - ISNULL((
          SELECT SUM(p.quantity)
          FROM dbo.TaskProgress p
          WHERE p.task_id = t.id
        ), 0) AS remaining
      FROM dbo.Tasks t
      WHERE t.id = @taskId
    `);
  return r.recordset[0]?.remaining ?? null;
}

async function ensureEnoughStockForOutbound(pool, fromStorageId, productId, needQty) {
  try {
    const q = await pool
      .request()
      .input("storageId", sql.Int, fromStorageId)
      .input("productId", sql.Int, productId)
      .query(`
        SELECT current_qty
        FROM dbo.v_CurrentStock WITH (NOEXPAND)
        WHERE storage_id = @storageId AND product_id = @productId
      `);

    if (q.recordset.length === 0) {
      if (STOCK_CHECK_SOFT) {
        logger.warn("[Tasks] v_CurrentStock вернул 0 строк — пропущено (SOFT)");
        return;
      }
      throw new Error("Невозможно проверить остаток: нет данных в v_CurrentStock");
    }

    const current = q.recordset[0].current_qty ?? 0;
    if (current < needQty) {
      throw new Error(`Недостаточно товара на складе: есть ${current}, требуется ${needQty}`);
    }
  } catch (err) {
    if (STOCK_CHECK_SOFT && /Invalid object name/i.test(err.message)) {
      logger.warn("[Tasks] v_CurrentStock не найден — пропущено (SOFT)");
      return;
    }
    throw err;
  }
}

/* Controllers */

export async function createTask(req, res) {
  const { managerId, foremanId, operation_type, product_id, quantity, comment } = req.body;

  if (!managerId || !foremanId || !operation_type || !product_id || !quantity) {
    return res.status(400).json({ message: "Не заполнены обязательные поля" });
  }

  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input("created_by", sql.Int, managerId)
      .input("assigned_to", sql.Int, foremanId)
      .input("status", sql.NVarChar(32), "pending")
      .input("operation_type", sql.NVarChar(16), operation_type)
      .input("product_id", sql.Int, product_id)
      .input("from_storage_id", sql.Int, null)
      .input("to_storage_id", sql.Int, null)
      .input("quantity", sql.Int, quantity)
      .input("comment", sql.NVarChar(sql.MAX), comment ?? null)
      .query(`
        INSERT INTO dbo.Tasks
          (created_by, assigned_to, status, operation_type, product_id, from_storage_id, to_storage_id, quantity, comment, created_at, updated_at)
        VALUES
          (@created_by, @assigned_to, @status, @operation_type, @product_id, @from_storage_id, @to_storage_id, @quantity, @comment, GETDATE(), GETDATE())
      `);

    res.status(201).json({ message: "Задача создана" });
  } catch (err) {
    logger.error("[createTask] " + err.message);
    res.status(500).json({ message: "Ошибка при создании задачи", error: err.message });
  }
}

export async function acceptTaskByForeman(req, res) {
  const { id } = req.params;
  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE dbo.Tasks
        SET status = 'accepted', updated_at = GETDATE()
        WHERE id = @id AND status = 'pending'
      `);

    res.json({ message: "Задача принята бригадиром" });
  } catch (err) {
    logger.error("[acceptTaskByForeman] " + err.message);
    res.status(500).json({ message: "Ошибка при принятии задачи", error: err.message });
  }
}

export async function assignTaskToForklift(req, res) {
  const { id } = req.params;
  const { forkliftUserId, from_storage_id, to_storage_id, quantity } = req.body;

  if (!forkliftUserId || !from_storage_id || !to_storage_id) {
    return res.status(400).json({ message: "forkliftUserId, from_storage_id и to_storage_id обязательны" });
  }

  try {
    const pool = await connectToDb();
    const task = await getTaskById(pool, id);
    if (!task) return res.status(404).json({ message: "Задача не найдена" });

    const q = quantity ?? task.quantity;

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("assigned_to", sql.Int, forkliftUserId)
      .input("from_storage_id", sql.Int, from_storage_id)
      .input("to_storage_id", sql.Int, to_storage_id)
      .input("quantity", sql.Int, q)
      .query(`
        UPDATE dbo.Tasks
        SET assigned_to = @assigned_to,
            from_storage_id = @from_storage_id,
            to_storage_id = @to_storage_id,
            quantity = @quantity,
            status = 'assigned',
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: "Задача назначена карщику" });
  } catch (err) {
    logger.error("[assignTaskToForklift] " + err.message);
    res.status(500).json({ message: "Ошибка при назначении задачи", error: err.message });
  }
}

export async function acceptTaskByForklift(req, res) {
  const { id } = req.params;
  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE dbo.Tasks
        SET status = 'in_progress', updated_at = GETDATE()
        WHERE id = @id AND status IN ('assigned','accepted')
      `);

    res.json({ message: "Задача принята карщиком" });
  } catch (err) {
    logger.error("[acceptTaskByForklift] " + err.message);
    res.status(500).json({ message: "Ошибка при принятии задачи карщиком", error: err.message });
  }
}

export async function pushTaskProgress(req, res) {
  const { id } = req.params;
  const { performed_by, quantity, comment } = req.body;

  if (!performed_by || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "performed_by и положительный quantity обязательны" });
  }

  const pool = await connectToDb();
  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();

    const taskReq = new sql.Request(tx);
    const task = await (async () => {
      const r = await taskReq
        .input("id", sql.Int, id)
        .query(
          `SELECT * FROM dbo.Tasks WITH (UPDLOCK, ROWLOCK) WHERE id = @id`
        );
      return r.recordset[0] || null;
    })();
    if (!task) {
      await tx.rollback();
      return res.status(404).json({ message: "Задача не найдена" });
    }

    const remainReq = new sql.Request(tx);
    const remain = await (async () => {
      const r = await remainReq
        .input("taskId", sql.Int, id)
        .query(`
          SELECT t.quantity - ISNULL((
            SELECT SUM(p.quantity)
            FROM dbo.TaskProgress p
            WHERE p.task_id = t.id
          ), 0) AS remaining
          FROM dbo.Tasks t
          WHERE t.id = @taskId
        `);
      return r.recordset[0]?.remaining ?? 0;
    })();

    if (quantity > remain) {
      await tx.rollback();
      return res
        .status(400)
        .json({ message: `Превышен остаток по задаче: осталось ${remain}, введено ${quantity}` });
    }

    if (String(task.operation_type).toLowerCase() === "outbound" && task.from_storage_id && task.product_id) {
      await ensureEnoughStockForOutbound(pool, task.from_storage_id, task.product_id, quantity);
    }

    const prReq = new sql.Request(tx);
    await prReq
      .input("task_id", sql.Int, id)
      .input("performed_by", sql.Int, performed_by)
      .input("quantity", sql.Int, quantity)
      .input("comment", sql.NVarChar(sql.MAX), comment ?? null)
      .query(`
        INSERT INTO dbo.TaskProgress (task_id, performed_by, quantity, operation_date, comment)
        VALUES (@task_id, @performed_by, @quantity, GETDATE(), @comment)
      `);

    const rem2Req = new sql.Request(tx);
    const rem2 = await (async () => {
      const r = await rem2Req
        .input("taskId", sql.Int, id)
        .query(`
          SELECT t.quantity - ISNULL((
            SELECT SUM(p.quantity)
            FROM dbo.TaskProgress p
            WHERE p.task_id = t.id
          ), 0) AS remaining
          FROM dbo.Tasks t
          WHERE t.id = @taskId
        `);
      return r.recordset[0]?.remaining ?? 0;
    })();

    const updReq = new sql.Request(tx);
    await updReq
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar(32), rem2 <= 0 ? "completed" : "in_progress")
      .query(`
        UPDATE dbo.Tasks
        SET status = @status, updated_at = GETDATE()
        WHERE id = @id
      `);

    await tx.commit();

    res.json({ message: "Прогресс зафиксирован", remaining: rem2, completed: rem2 <= 0 });
  } catch (err) {
    if (tx._aborted !== true) {
      try {
        await tx.rollback();
      } catch {}
    }
    logger.error("[pushTaskProgress] " + err.message);
    res.status(500).json({ message: "Ошибка при фиксации прогресса", error: err.message });
  }
}

export async function completeTask(req, res) {
  const { id } = req.params;
  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE dbo.Tasks
        SET status = 'completed', updated_at = GETDATE()
        WHERE id = @id AND status <> 'completed'
      `);
    res.json({ message: "Задача завершена" });
  } catch (err) {
    logger.error("[completeTask] " + err.message);
    res.status(500).json({ message: "Ошибка при завершении задачи", error: err.message });
  }
}

export async function cancelTask(req, res) {
  const { id } = req.params;
  try {
    const pool = await connectToDb();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        UPDATE dbo.Tasks
        SET status = 'canceled', updated_at = GETDATE()
        WHERE id = @id AND status NOT IN ('completed','canceled')
      `);
    res.json({ message: "Задача отменена" });
  } catch (err) {
    logger.error("[cancelTask] " + err.message);
    res.status(500).json({ message: "Ошибка при отмене задачи", error: err.message });
  }
}

export async function listTasks(req, res) {
  const { role, userId, status } = req.query;

  try {
    const pool = await connectToDb();

    const where = [];
    if (role === "manager" && userId) {
      where.push(`t.created_by = @userId`);
    } else if (role === "foreman" && userId) {
      where.push(
        `t.assigned_to = @userId AND t.status IN ('pending','accepted','assigned','in_progress')`
      );
    } else if (role === "forklift" && userId) {
      where.push(`t.assigned_to = @userId AND t.status IN ('assigned','in_progress')`);
    }

    if (status) {
      const statuses = String(status)
        .split(",")
        .map((s) => `'${s.trim()}'`)
        .filter(Boolean)
        .join(",");
      if (statuses) where.push(`t.status IN (${statuses})`);
    }

    const reqSql = pool.request();
    if (userId) reqSql.input("userId", sql.Int, +userId);

    const result = await reqSql.query(`
      SELECT
        t.id,
        t.created_by,
        t.assigned_to,
        CONVERT(NVARCHAR(32), t.status) AS status,
        CONVERT(NVARCHAR(16), t.operation_type) AS operation_type,
        t.product_id,
        t.from_storage_id,
        t.to_storage_id,
        t.quantity,
        CONVERT(NVARCHAR(MAX), t.comment) AS comment,
        t.created_at,
        t.updated_at
      FROM dbo.Tasks t
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY t.created_at DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    logger.error("[listTasks] " + err.message);
    res.status(500).json({ message: "Ошибка при получении списка задач", error: err.message });
  }
}

export async function getTaskDetails(req, res) {
  const { id } = req.params;
  try {
    const pool = await connectToDb();

    const task = await getTaskById(pool, +id);
    if (!task) return res.status(404).json({ message: "Задача не найдена" });

    const progress = await pool
      .request()
      .input("taskId", sql.Int, +id)
      .query(`
        SELECT
          p.id,
          p.task_id,
          p.performed_by,
          p.quantity,
          p.operation_date,
          CONVERT(NVARCHAR(MAX), p.comment) AS comment
        FROM dbo.TaskProgress p
        WHERE p.task_id = @taskId
        ORDER BY p.operation_date DESC, p.id DESC
      `);

    const remaining = await getRemainingQuantity(pool, +id);

    res.json({ task, progress: progress.recordset, remaining });
  } catch (err) {
    logger.error("[getTaskDetails] " + err.message);
    res.status(500).json({ message: "Ошибка при получении задачи", error: err.message });
  }
}
