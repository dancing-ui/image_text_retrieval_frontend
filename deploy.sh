#!/bin/zsh

PORT=9528
PROJECT_NAME="image-text-retrieval"

echo "开始部署 $PROJECT_NAME..."

# 检查 Node.js 版本
echo "切换到 Node.js v22.12.0..."
nvm use v22.12.0

# 安装 serve
echo "确保 serve 已安装..."
npm install -g serve

# 检查端口是否被占用
check_port() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
        echo "端口 $PORT 已被占用"
        return 1
    else
        echo "端口 $PORT 可用"
        return 0
    fi
}

# 杀死可能存在的旧进程
kill_existing_process() {
    echo "检查并停止现有的 serve 进程..."
    
    # 方法1: 通过端口杀死进程
    local pid=$(lsof -ti :$PORT)
    if [ ! -z "$pid" ]; then
        echo "发现占用端口 $PORT 的进程 (PID: $pid)，正在停止..."
        kill -TERM $pid 2>/dev/null
        sleep 2
        
        # 如果进程仍然存在，强制杀死
        if kill -0 $pid 2>/dev/null; then
            echo "强制停止进程 $pid..."
            kill -KILL $pid 2>/dev/null
        fi
    fi
    
    # 方法2: 通过进程名杀死相关进程
    pkill -f "serve.*$PORT" 2>/dev/null || true
    
    # 等待进程完全停止
    sleep 1
}

# 启动服务
start_serve() {
    echo "启动 serve 服务器..."
    
    # 创建 PID 文件目录
    mkdir -p ~/.local/run
    
    # 后台启动 serve 并保存 PID
    nohup serve -s dist -l $PORT > serve.log 2>&1 &
    local serve_pid=$!
    
    # 保存 PID 到文件
    echo $serve_pid > ~/.local/run/${PROJECT_NAME}.pid
    
    echo "服务已启动 (PID: $serve_pid)"
    echo "访问地址: http://localhost:$PORT"
    echo "日志文件: $(pwd)/serve.log"
    echo "PID 文件: ~/.local/run/${PROJECT_NAME}.pid"
    
    # 检查服务是否成功启动
    sleep 2
    if kill -0 $serve_pid 2>/dev/null; then
        echo "✅ 部署成功！"
    else
        echo "❌ 服务启动失败，请检查日志文件"
        exit 1
    fi
}

# 主流程
main() {
    # 停止现有进程
    kill_existing_process
    
    # 再次检查端口
    if ! check_port; then
        echo "端口仍被占用，请手动检查"
        exit 1
    fi
    
    # 启动新服务
    start_serve
}

# 执行主流程
main