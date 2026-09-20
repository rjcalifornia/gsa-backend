<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FuelContainer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'capacity_gallons',
        'active',
    ];

    protected $casts = [
        'capacity_gallons' => 'decimal:2',
        'active' => 'boolean',
    ];

    public function fuelRecords(): HasMany
    {
        return $this->hasMany(FuelRecord::class);
    }
}