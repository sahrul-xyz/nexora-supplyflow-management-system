@echo off
echo ===================================================
echo Menjalankan MySQL SupplyFlow (Port 3306)...
echo Status: Aktif jika muncul 'ready for connections'
echo PENTING: JANGAN TUTUP JENDELA INI SELAMA APLIKASI BERJALAN!
echo ===================================================
"C:\xampp\mysql\bin\mysqld.exe" --datadir="C:\xampp\mysql\data_supplyflow" --port=3306 --console
pause
