// initPermissions.js — автоматическая инициализация прав доступа и пользователя "monitor"

import sql from "./db.js";
import logger from "./logger.js";

/**
 * Инициализация стандартных прав и системного пользователя monitor
 * Автоматически вызывается из index.js при старте backend
 */
export async function initPermissions() {
  try {
    // Проверяем наличие таблицы Permissions
    const tableCheck = await sql.query`
      IF OBJECT_ID('Permissions', 'U') IS NULL
      BEGIN
        RAISERROR('Таблица Permissions не найдена', 16, 1)
      END
    `;

    // Проверяем, есть ли записи
    const countRes = await sql.query`SELECT COUNT(*) AS count FROM Permissions`;
    const hasPermissions = countRes.recordset[0].count > 0;

    if (!hasPermissions) {
      logger.info("🧩 Инициализация стандартных прав доступа...");

      await sql.query`
        INSERT INTO Permissions (permission_key, name, description)
        VALUES
          ('storages:read', N'Доступ к складам', N'Просмотр списка холодильников'),
          ('monitor:read', N'Мониторинг', N'Просмотр реальных мониторов'),
          ('storage-stats:read', N'Статистика', N'Просмотр данных холодильников')
      `;

      logger.info("✅ Базовые права успешно добавлены");
    } else {
      logger.info("✅ Права уже существуют, пропуск инициализации");
    }

    // Проверяем наличие пользователя monitor
    const userCheck = await sql.query`
      SELECT id FROM employees WHERE name = 'monitor'
    `;

    let monitorId;

    if (userCheck.recordset.length === 0) {
      const newUser = await sql.query`
        INSERT INTO employees (name, position, department, hire_date, is_active)
        VALUES ('monitor', N'Системный монитор', N'Система', GETDATE(), 1);
        SELECT SCOPE_IDENTITY() AS id;
      `;
      monitorId = newUser.recordset[0].id;
      logger.info(`👤 Создан пользователь 'monitor' (id=${monitorId})`);
    } else {
      monitorId = userCheck.recordset[0].id;
      logger.info(`👤 Пользователь 'monitor' уже существует (id=${monitorId})`);
    }

    // Привязываем права пользователю monitor, если их нет
    await sql.query`
      INSERT INTO UserPermissions (user_id, permission_id, is_allowed)
      SELECT ${monitorId}, p.id, 1
      FROM Permissions p
      WHERE p.permission_key IN ('storages:read', 'monitor:read', 'storage-stats:read')
      AND NOT EXISTS (
        SELECT 1 FROM UserPermissions up
        WHERE up.user_id = ${monitorId} AND up.permission_id = p.id
      )
    `;

    logger.info("🔐 Права успешно назначены пользователю 'monitor'");

    logger.info("✅ Инициализация прав и пользователя завершена успешно");
  } catch (err) {
    logger.error("❌ Ошибка при инициализации прав", err);
  }
}
