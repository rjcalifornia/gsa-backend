<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fuel_records', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            $table->foreignId('supplied_by')
                ->nullable()
                ->constrained('employees')
                ->nullOnDelete();

            $table->foreignId('fuel_container_id')
                ->nullable()
                ->constrained('fuel_containers')
                ->nullOnDelete();

            $table->decimal('container_quantity', 8, 2)
                ->nullable();

            $table->decimal('gallons', 10, 2)
                ->nullable();

            $table->decimal('price_per_gallon', 10, 2)
                ->nullable();

            $table->decimal('total_cost', 12, 2)
                ->nullable();

            $table->decimal('odometer', 12, 2)
                ->nullable();

            $table->dateTime('date');

            $table->text('observations')
                ->nullable();

            $table->foreignId('recorded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index([
                'vehicle_id',
                'date',
            ]);

            $table->index('supplied_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fuel_records');
    }
};