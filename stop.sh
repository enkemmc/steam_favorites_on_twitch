docker stop $(docker ps -a -q) && docker kill $(docker ps -q) && docker rm $(docker ps -a -q)
