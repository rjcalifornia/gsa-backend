<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Team extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'teams';

    protected $fillable = [
        'name',
        'team_name',
        'pin',
        'active',
        'is_manager',
    ];

     protected $hidden = [
        'pin',
        'remember_token',
    ];


    protected $casts = [
        'pin' => 'string',
        'active' => 'boolean',
        'is_manager' => 'boolean',
    ];
}