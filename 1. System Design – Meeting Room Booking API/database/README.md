docker run --name=mysql_db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=building_db -p 3306:3306 -d mysql


docker run --name myadmin -d --link mysql_db:db -p 8081:80 phpmyadmin/phpmyadmin