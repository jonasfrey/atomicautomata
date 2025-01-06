pid_websersocket=$(pgrep -f "websersocket_db4e4c71-282e-42b8-bc0c-8139c7d21cd1.js")
watch -n 1 ps -p $pid_websersocket -o pid,etime,%cpu,%mem,cmd