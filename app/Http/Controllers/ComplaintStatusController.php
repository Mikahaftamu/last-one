<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplaintStatusController extends Controller
{
    public function update(Request $request, Complaint $complaint)
    {
        $request->validate([
            'status' => 'required|in:assigned,in_progress,completed,verified',
            'resolution_notes' => 'required_if:status,completed,verified',
            'resolution_image' => 'nullable|image|max:2048'
        ]);

        // Check if user has permission to update status
        $user = auth()->user();
        $canUpdate = false;

        // Admin can update any status
        if ($user->hasRole('admin')) {
            $canUpdate = true;
        }
        // Coordinators can update status of their assigned complaints
        elseif ($user->hasRole(['cleaning_coordinator', 'general_coordinator', 'coordinator']) 
            && $complaint->assigned_coordinator_id === $user->id) {
            $canUpdate = true;
        }
        // Workers can only update status of their assigned complaints
        elseif ($user->hasRole('worker') && $complaint->assigned_worker_id === $user->id) {
            $canUpdate = true;
        }

        if (!$canUpdate) {
            return back()->with('error', 'You do not have permission to update this complaint status.');
        }

        // Handle image upload if present
        if ($request->hasFile('resolution_image')) {
            $path = $request->file('resolution_image')->store('resolution-images', 'public');
            $complaint->resolution_image = $path;
        }

        // Update complaint status and resolution details
        $complaint->update([
            'status' => $request->status,
            'resolution_notes' => $request->resolution_notes,
            'resolved_at' => $request->status === 'completed' ? now() : null,
            'verified_at' => $request->status === 'verified' ? now() : null,
        ]);

        return back()->with('success', 'Complaint status updated successfully.');
    }
} 