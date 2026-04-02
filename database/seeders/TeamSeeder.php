<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Team;
use Illuminate\Support\Facades\Hash;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         Team::create([
            'name' => 'Mario Gomez',
            'team_name' => 'Equipo 1',
            'pin' => Hash::make('1234'),
            'active' => true,
            'is_manager' => true,
        ]);

        Team::create([
            'name' => 'Juan Carlos Perez',
            'team_name' => 'Equipo 2',
            'pin' => Hash::make('1234'),
            'active' => true,
            'is_manager' => false,
        ]);
    }
}
