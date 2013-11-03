D:
cd D:\nginx-1.5.6
nginx -s quit
start nginx
cd D:\mongodb\bin
start mongod --dbpath D:\mongodb\data
cd D:\popush
node app.js