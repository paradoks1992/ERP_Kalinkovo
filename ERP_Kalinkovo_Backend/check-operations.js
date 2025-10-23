// backend/check-operations.js
import { sequelize, Operation, Refrigerator, Balance } from './src/models/index.js';

async function checkOperations() {
  try {
    console.log('🔍 Проверка операций в базе данных...\n');
    
    await sequelize.authenticate();
    console.log('✅ Подключение к БД установлено\n');
    
    // Проверяем холодильники
    const refrigerators = await Refrigerator.findAll();
    console.log('📋 Холодильники в базе:');
    refrigerators.forEach(fridge => {
      console.log(`   ID: ${fridge.id}, Name: ${fridge.name}, Location: ${fridge.location}`);
    });
    
    console.log('\n');
    
    // Проверяем последние операции
    const operations = await Operation.findAll({
      limit: 10,
      order: [['timestamp', 'DESC']],
      include: ['Refrigerator']
    });
    
    console.log('📦 Последние 10 операций:');
    if (operations.length === 0) {
      console.log('   ❌ Операций нет в базе данных');
    } else {
      operations.forEach(op => {
        console.log(`   ID: ${op.id}, Операция: ${op.operation}, Сорт: ${op.sort}, Холодильник: ${op.Refrigerator ? op.Refrigerator.name : 'N/A'}, Дата: ${op.timestamp}`);
      });
    }
    
    console.log('\n');
    
    // Проверяем балансы
    const balances = await Balance.findAll({
      where: { quantity: { $gt: 0 } },
      limit: 10
    });
    
    console.log('📊 Активные балансы:');
    if (balances.length === 0) {
      console.log('   ❌ Активных балансов нет');
    } else {
      balances.forEach(balance => {
        console.log(`   Сорт: ${balance.sort}, Тип: ${balance.type}, Количество: ${balance.quantity}, Холодильник: ${balance.refrigerator_id}`);
      });
    }
    
    console.log('\n✅ Проверка завершена');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке:', error);
  } finally {
    await sequelize.close();
  }
}

checkOperations();