<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EmployeeVehicleAssignment extends Pivot
{
    protected $table = 'employee_vehicle_assignments';

    protected $fillable = [
        'employee_id',
        'vehicle_id',
        'assigned_at',
        'ended_at',
        'active',
    ];

    protected $casts = [
        'assigned_at' => 'date',
        'ended_at' => 'date',
        'active' => 'boolean',
    ];
}