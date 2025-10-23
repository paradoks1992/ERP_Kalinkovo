# ===============================
# update.ps1 — автоматический пуш
# ===============================

# Переходим в корень проекта (на всякий случай)
Set-Location "C:\ERP_Kalinkovo"

# Проверяем статус
Write-Host "🔍 Проверяю статус репозитория..."
git status

# Добавляем все изменения
Write-Host "`n📦 Добавляю все изменённые файлы..."
git add .

# Создаём коммит с текущей датой и временем
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$message = "Автообновление: $timestamp"
Write-Host "`n📝 Создаю коммит: $message"
git commit -m "$message"

# Отправляем на GitHub
Write-Host "`n🚀 Отправляю изменения на GitHub..."
git push

# Проверяем итог
Write-Host "`n✅ Готово! Текущий статус:"
git status
