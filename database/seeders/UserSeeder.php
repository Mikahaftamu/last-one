<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Campus;
use App\Models\ComplaintType;
use App\Models\UserRole;
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

        UserRole::updateOrCreate([
            'user_id' => $admin->id,
            'role' => 'admin',
        ]);

        // Create VP
        $vp = User::updateOrCreate([
            'email' => 'vp@example.com',
        ], [
            'name' => 'Vice President',
            'password' => Hash::make('password'),
        ]);

        UserRole::updateOrCreate([
            'user_id' => $vp->id,
            'role' => 'vp',
        ]);

        // Create Director
        $director = User::updateOrCreate([
            'email' => 'director@example.com',
        ], [
            'name' => 'Student Service Director',
            'password' => Hash::make('password'),
        ]);

        UserRole::updateOrCreate([
            'user_id' => $director->id,
            'role' => 'director',
        ]);

        // Create coordinators and workers for each campus
        $campuses = Campus::all();
        $complaintTypes = ComplaintType::all();

        foreach ($campuses as $campus) {
            // Create Cleaning Coordinator
            $cleaningCoordinator = User::updateOrCreate([
                'email' => "cleaning.{$campus->code}@example.com",
            ], [
                'name' => "Cleaning Coordinator - {$campus->name}",
                'password' => Hash::make('password'),
            ]);

            UserRole::updateOrCreate([
                'user_id' => $cleaningCoordinator->id,
                'role' => 'cleaning_coordinator',
                'campus_id' => $campus->id,
                'complaint_type_id' => $complaintTypes->where('name', 'Cleaning')->first()->id,
            ]);

            // Create General Coordinator
            $generalCoordinator = User::updateOrCreate([
                'email' => "general.{$campus->code}@example.com",
            ], [
                'name' => "General Coordinator - {$campus->name}",
                'password' => Hash::make('password'),
            ]);

            UserRole::updateOrCreate([
                'user_id' => $generalCoordinator->id,
                'role' => 'general_coordinator',
                'campus_id' => $campus->id,
                'complaint_type_id' => $complaintTypes->where('name', 'Other')->first()->id,
            ]);

            // Create coordinators for Plumbing, Water, and Electricity
            foreach (['Plumbing', 'Water', 'Electricity'] as $type) {
                $coordinator = User::updateOrCreate([
                    'email' => strtolower("{$type}.{$campus->code}@example.com"),
                ], [
                    'name' => "{$type} Coordinator - {$campus->name}",
                    'password' => Hash::make('password'),
                ]);

                UserRole::updateOrCreate([
                    'user_id' => $coordinator->id,
                    'role' => 'coordinator',
                    'campus_id' => $campus->id,
                    'complaint_type_id' => $complaintTypes->where('name', $type)->first()->id,
                ]);

                // Create workers for each coordinator
                for ($i = 1; $i <= 3; $i++) {
                    $worker = User::updateOrCreate([
                        'email' => strtolower("{$type}.worker{$i}.{$campus->code}@example.com"),
                    ], [
                        'name' => "{$type} Worker {$i} - {$campus->name}",
                        'password' => Hash::make('password'),
                    ]);

                    UserRole::updateOrCreate([
                        'user_id' => $worker->id,
                        'role' => 'worker',
                        'campus_id' => $campus->id,
                        'complaint_type_id' => $complaintTypes->where('name', $type)->first()->id,
                    ]);
                }
            }
        }
    }
} 