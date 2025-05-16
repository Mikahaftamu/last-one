<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['role' => 'admin', 'description' => 'System Administrator'],
            ['role' => 'vp', 'description' => 'Vice President'],
            ['role' => 'director', 'description' => 'Director'],
            ['role' => 'coordinator', 'description' => 'Coordinator'],
            ['role' => 'worker', 'description' => 'Worker'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
} 