<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UniformStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'uniform_id',
        'size',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function uniform(): BelongsTo
    {
        return $this->belongsTo(Uniform::class);
    }
}