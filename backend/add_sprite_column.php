<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    if (!Schema::hasColumn('characters', 'sprite_data')) {
        Schema::table('characters', function (Blueprint $table) {
            $table->longText('sprite_data')->nullable();
        });
        echo "Column 'sprite_data' added successfully.\n";
    } else {
        echo "Column 'sprite_data' already exists.\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
