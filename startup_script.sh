docker build -t mytool ./TOOLS/test/
docker run -itd --name toolA -v datavol:/app/data/ mytool bash

npm start