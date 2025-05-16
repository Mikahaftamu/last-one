<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'System Admin',
            'password' => Hash::make('password'),
        ]);

        $adminRole = Role::where('role', 'admin')->first();
        if ($adminRole) {
            UserRole::updateOrCreate([
                'user_id' => $admin->id,
                'role_id' => $adminRole->id,
            ]);
        }
    }
} 