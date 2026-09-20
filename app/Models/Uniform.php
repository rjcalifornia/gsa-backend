<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Uniform extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function stocks(): HasMany
    {
        return $this->hasMany(UniformStock::class);
    }
}