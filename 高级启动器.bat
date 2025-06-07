@echo off
title 坦克大战 - 高级启动器
color 0B
chcp 65001 >nul

:MAIN_MENU
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🎮 双人坦克大战游戏 🎮                      ║
echo ║                      模块化增强版 v2.0                        ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  1. 🚀 启动游戏                                              ║
echo ║  2. 🔍 检查游戏文件                                          ║
echo ║  3. 📖 查看游戏说明                                          ║
echo ║  4. 🛠️  故障排除                                             ║
echo ║  5. ❌ 退出                                                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
set /p choice=请选择操作（1-5）:

if "%choice%"=="1" goto START_GAME
if "%choice%"=="2" goto CHECK_FILES
if "%choice%"=="3" goto SHOW_HELP
if "%choice%"=="4" goto TROUBLESHOOT
if "%choice%"=="5" goto EXIT
goto MAIN_MENU

:START_GAME
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        🚀 启动游戏                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 正在检查游戏文件...

REM 检查核心文件
call :CHECK_FILE "index.html" "主游戏页面"
call :CHECK_FILE "game-main.js" "游戏主逻辑"
call :CHECK_FILE "tank.js" "坦克系统"
call :CHECK_FILE "bullet.js" "子弹系统"
call :CHECK_FILE "game-utils.js" "工具模块"
call :CHECK_FILE "styles.css" "样式文件"

echo.
echo ✅ 所有文件检查完毕！
echo.
echo 🎮 正在启动游戏...
start "" "index.html"

if %errorlevel% equ 0 (
    echo.
    echo ✅ 游戏已成功在浏览器中打开！
    echo.
    echo 💡 快速提示：
    echo    - 按 F1 切换单人/双人模式
    echo    - 单人模式可与AI对战
    echo    - AI具备智能战术决策能力
    echo.
) else (
    echo.
    echo ❌ 自动启动失败，请手动打开 index.html 文件
)

echo 按任意键返回主菜单...
pause >nul
goto MAIN_MENU

:CHECK_FILES
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        🔍 文件检查                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

call :CHECK_FILE_DETAILED "index.html" "主游戏页面"
call :CHECK_FILE_DETAILED "game-main.js" "游戏主逻辑"
call :CHECK_FILE_DETAILED "tank.js" "坦克系统（含AI）"
call :CHECK_FILE_DETAILED "bullet.js" "子弹系统"
call :CHECK_FILE_DETAILED "game-utils.js" "工具模块"
call :CHECK_FILE_DETAILED "styles.css" "样式文件"

echo.
echo 📁 可选文件：
call :CHECK_FILE_OPTIONAL "README.md" "说明文档"
call :CHECK_FILE_OPTIONAL "game.js" "旧版游戏文件（可删除）"

echo.
echo 按任意键返回主菜单...
pause >nul
goto MAIN_MENU

:SHOW_HELP
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        📖 游戏说明                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🎮 控制说明：
echo    ┌─────────────────────┬─────────────────────┐
echo    │  玩家1（绿色坦克）   │  玩家2（蓝色坦克）   │
echo    ├─────────────────────┼─────────────────────┤
echo    │  WASD - 移动        │  方向键 - 移动      │
echo    │  空格 - 射击        │  Enter - 射击       │
echo    └─────────────────────┴─────────────────────┘
echo.
echo 🤖 游戏模式：
echo    F1键 - 切换单人/双人模式
echo    • 双人模式：两名玩家对战
echo    • 单人模式：与智能AI对战
echo.
echo ✨ 游戏特色：
echo    • 智能AI对手 - 具备战术决策能力
echo    • 炮塔独立旋转 - 车体和炮塔分离控制
echo    • 粒子特效 - 爆炸和子弹轨迹效果
echo    • 模块化架构 - 更好的性能和维护性
echo    • 对象池优化 - 流畅的游戏体验
echo.
echo 🎯 游戏目标：
echo    • 击败对手获得胜利
echo    • 每次击中对手获得100分
echo    • 每个玩家有3条生命
echo.
echo 按任意键返回主菜单...
pause >nul
goto MAIN_MENU

:TROUBLESHOOT
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        🛠️ 故障排除                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🔧 常见问题解决方案：
echo.
echo 1. ❓ 游戏无法启动？
echo    • 确保所有必需文件都在同一文件夹中
echo    • 尝试使用现代浏览器（Chrome、Firefox、Edge）
echo    • 检查浏览器是否支持HTML5 Canvas
echo.
echo 2. ❓ 坦克无法移动？
echo    • 确保游戏窗口处于焦点状态
echo    • 检查键盘输入是否正常
echo    • 刷新页面重新加载游戏
echo.
echo 3. ❓ AI不工作？
echo    • 按F1切换到单人模式
echo    • 确保tank.js文件完整
echo    • 检查浏览器控制台是否有错误
echo.
echo 4. ❓ 页面显示异常？
echo    • 清除浏览器缓存
echo    • 检查styles.css文件是否存在
echo    • 尝试使用无痕/隐私模式
echo.
echo 5. ❓ 性能问题？
echo    • 关闭其他占用资源的程序
echo    • 降低浏览器缩放比例
echo    • 确保使用硬件加速
echo.
echo 📧 如果问题仍然存在，请检查README.md文件获取更多信息
echo.
echo 按任意键返回主菜单...
pause >nul
goto MAIN_MENU

:CHECK_FILE
if exist "%~1" (
    echo ✅ %~2 - %~1
) else (
    echo ❌ %~2 - %~1 ^(缺失^)
    set ERROR_FOUND=1
)
exit /b

:CHECK_FILE_DETAILED
if exist "%~1" (
    for %%A in ("%~1") do (
        echo ✅ %~2
        echo    📄 文件名: %~1
        echo    📊 大小: %%~zA 字节
        echo    📅 修改时间: %%~tA
        echo.
    )
) else (
    echo ❌ %~2
    echo    📄 文件名: %~1 ^(文件缺失^)
    echo    ⚠️  这是必需文件，游戏可能无法正常运行
    echo.
)
exit /b

:CHECK_FILE_OPTIONAL
if exist "%~1" (
    echo ✅ %~2 - %~1
) else (
    echo ➖ %~2 - %~1 ^(可选^)
)
exit /b

:EXIT
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      👋 感谢使用                              ║
echo ║                    双人坦克大战游戏                            ║
echo ║                      祝您游戏愉快！                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
timeout /t 2 >nul
exit
