<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
        protected $table = 'products';
     protected $fillable = [
        'name',
        'category_id',
        'unit_id',
        'price',
        'sku',
        'description',
        'active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'active' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Categories::class);
    }

    public function unit()
    {
        return $this->belongsTo(Units::class);
    }
}
