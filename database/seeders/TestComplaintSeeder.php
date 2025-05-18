<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Complaint;
use App\Models\Campus;
use App\Models\ComplaintType;

class TestComplaintSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find a worker user
        $worker = User::whereHas('roles', function($query) {
            $query->where('roles.role', 'worker');
        })->first();

        if (!$worker) {
            $this->command->info('No worker found. Please run the UserSeeder first.');
            return;
        }

        // Find campus and complaint type
        $campus = Campus::first();
        $complaintType = ComplaintType::first();

        if (!$campus || !$complaintType) {
            $this->command->info('No campus or complaint type found. Please run the CampusSeeder and ComplaintTypeSeeder first.');
            return;
        }

        // Find coordinator user
        $coordinator = User::whereHas('roles', function($query) {
            $query->where('roles.role', 'coordinator');
        })->first();

        if (!$coordinator) {
            $this->command->info('No coordinator found. Please run the UserSeeder first.');
            return;
        }

        // Create test complaints assigned to the worker
        $statuses = ['pending', 'in_progress', 'completed'];
        
        foreach($statuses as $index => $status) {
            $complaint = new Complaint();
            $complaint->campus_id = $campus->id;
            $complaint->complaint_type_id = $complaintType->id;
            $complaint->location = 'Test Location ' . ($index + 1);
            $complaint->description = 'Test Description ' . ($index + 1);
            $complaint->status = $status;
            $complaint->assigned_coordinator_id = $coordinator->id;
            $complaint->assigned_worker_id = $worker->id;
            
            if ($status === 'completed') {
                $complaint->resolved_at = now();
                $complaint->resolution_notes = 'Test resolution notes';
            }
            
            $complaint->save();
            
            $this->command->info('Created complaint with ID: ' . $complaint->complaint_id);
        }
    }
} 