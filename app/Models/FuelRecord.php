<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'supplied_by',
        'fuel_container_id',
        'container_quantity',
        'gallons',
        'price_per_gallon',
        'total_cost',
        'odometer',
        'date',
        'observations',
        'recorded_by',
    ];

    protected $casts = [
        'container_quantity' => 'decimal:2',
        'gallons' => 'decimal:2',
        'price_per_gallon' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'odometer' => 'decimal:2',
        'date' => 'datetime',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(
            Employee::class,
            'supplied_by'
        );
    }

    public function fuelContainer(): BelongsTo
    {
        return $this->belongsTo(FuelContainer::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'recorded_by'
        );
    }
}