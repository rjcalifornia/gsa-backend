<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;


class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       User::create([
            'name' => 'Johanna',
            'lastname' => 'Doe',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => '12345',
            'rol_id' => 1,
            'active' => 1,
            'user_creates' => null,
            'user_modifies' => null,
        ]);

        User::create([
            'name' => 'John',
            'lastname' => 'Doe',
            'username' => 'jdoe',
            'email' => 'jdoe@example.com',
            'password' => '12345',
            'rol_id' => 2,
            'active' => 1,
            'user_creates' => 1,
            'user_modifies' => null,
        ]);
    }
}
