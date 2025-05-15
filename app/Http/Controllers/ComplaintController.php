<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Campus;
use App\Models\ComplaintType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ComplaintController extends Controller
{
    public function create()
    {
        return Inertia::render('Complaints/Create', [
            'campuses' => Campus::all(),
            'complaintTypes' => ComplaintType::all(),
        ]);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('Received complaint submission:', $request->all());

            $validated = $request->validate([
                'campus_id' => 'required|exists:campuses,id',
                'complaint_type_id' => 'required|exists:complaint_types,id',
                'location' => 'required|string|max:255',
                'description' => 'required|string',
                'image' => 'nullable|image|max:2048'
            ]);

            \Log::info('Validated data:', $validated);

            // Create the complaint with all required fields
            $complaint = new Complaint();
            $complaint->campus_id = $validated['campus_id'];
            $complaint->complaint_type_id = $validated['complaint_type_id'];
            $complaint->location = $validated['location'];
            $complaint->description = $validated['description'];
            $complaint->status = 'pending';
            
            // Handle image upload if present
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('complaints', 'public');
                $complaint->image_path = $path;
                \Log::info('Image uploaded:', ['path' => $path]);
            }

            // Save the complaint
            $saved = $complaint->save();
            \Log::info('Save operation result:', ['saved' => $saved]);

            if (!$saved) {
                throw new \Exception('Failed to save complaint to database');
            }

            \Log::info('Complaint created successfully:', [
                'complaint_id' => $complaint->complaint_id,
                'campus_id' => $complaint->campus_id,
                'type_id' => $complaint->complaint_type_id,
                'location' => $complaint->location,
                'description' => $complaint->description
            ]);

            return redirect()->route('complaints.show', $complaint->complaint_id)
                ->with('message', 'Complaint submitted successfully. Your complaint ID is: ' . $complaint->complaint_id);

        } catch (\Exception $e) {
            \Log::error('Error creating complaint: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create complaint: ' . $e->getMessage()]);
        }
    }

    public function show($complaintId)
    {
        $complaint = Complaint::with(['campus', 'complaintType', 'coordinator', 'worker'])
            ->where('complaint_id', $complaintId)
            ->firstOrFail();

        return Inertia::render('Complaints/Show', [
            'complaint' => $complaint
        ]);
    }

    public function track()
    {
        return Inertia::render('Complaints/Track');
    }

    public function trackComplaint(Request $request)
    {
        $request->validate([
            'complaint_id' => 'required|string'
        ]);

        $complaint = Complaint::with(['campus', 'complaintType', 'coordinator', 'worker'])
            ->where('complaint_id', $request->complaint_id)
            ->firstOrFail();

        return Inertia::render('Complaints/Show', [
            'complaint' => $complaint
        ]);
    }
} 