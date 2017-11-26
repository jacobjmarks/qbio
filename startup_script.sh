docker build -t mytool ./TOOLS/test/
docker run -itd -v datavol:/app/data/ mytool bash

npm start