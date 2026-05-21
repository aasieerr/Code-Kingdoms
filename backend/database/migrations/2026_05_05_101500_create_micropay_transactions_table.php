<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('micropay_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('stripe_session_id')->unique();
            $table->string('package', 32);
            $table->unsignedInteger('code_coins_credited');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('micropay_transactions');
    }
};
