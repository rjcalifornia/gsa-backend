<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_vehicle_assignments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();

            $table->date('assigned_at');

            $table->date('ended_at')->nullable();

            $table->boolean('active')->default(true);

            $table->timestamps();

            $table->index([
                'employee_id',
                'vehicle_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_vehicle_assignments');
    }
};