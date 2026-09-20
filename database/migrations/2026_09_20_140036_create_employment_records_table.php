<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employment_records', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->foreignId('job_position_id')
                ->nullable()
                ->constrained('job_positions')
                ->nullOnDelete();

            $table->string('employment_type', 30);

            $table->date('hire_date');

            $table->string('contract_path')
                ->nullable();

            $table->decimal('salary', 10, 2)
                ->nullable();

            $table->date('end_date')
                ->nullable();

            $table->string('end_reason', 50)
                ->nullable();

            $table->string('end_document_path')
                ->nullable();

            $table->boolean('active')
                ->default(true);

            $table->timestamps();

            $table->index([
                'employee_id',
                'active',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employment_records');
    }
};