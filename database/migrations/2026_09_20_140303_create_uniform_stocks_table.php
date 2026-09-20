<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('uniform_stocks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('uniform_id')
                ->constrained('uniforms')
                ->cascadeOnDelete();

            $table->string('size', 10);

            $table->unsignedInteger('quantity')
                ->default(0);

            $table->timestamps();

            $table->unique([
                'uniform_id',
                'size',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uniform_stocks');
    }
};