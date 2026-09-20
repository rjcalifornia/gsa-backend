<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fuel_containers', function (Blueprint $table) {
            $table->id();

            $table->string('name', 100);

            $table->decimal('capacity_gallons', 8, 2)
                ->default(8.00);

            $table->boolean('active')
                ->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_containers');
    }
};