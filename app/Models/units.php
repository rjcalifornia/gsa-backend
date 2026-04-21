<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Units extends Model
{
        protected $table = 'units';
        protected $fillable = [
        'name',
        'base_quantity',
        'active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'base_quantity' => 'decimal:2',
        'active' => 'boolean',
    ];

}
