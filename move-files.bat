mkdir src\app\core
mkdir src\app\core\services
mkdir src\app\core\interfaces
mkdir src\app\shared\components
move /Y src\app\services\* src\app\core\services\
move /Y src\app\interfaces\* src\app\core\interfaces\
move /Y src\app\shared\toast src\app\shared\components\
move /Y src\app\shared\search src\app\shared\components\
move /Y src\app\shared\receipt-modal src\app\shared\components\
rmdir /S /Q src\app\services
rmdir /S /Q src\app\interfaces
echo DONE > move_done.txt
