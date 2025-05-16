<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRole;
use App\Models\Campus;
use App\Models\ComplaintType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    public function dashboard()
    {
        try {
            // Load users with their roles and explicitly include the pivot data
            $users = User::with(['roles' => function($query) {
                $query->withPivot('campus_id', 'complaint_type_id');
            }])->get();
            
            $campuses = Campus::all();
            $complaintTypes = ComplaintType::all();

            Log::info('Admin dashboard accessed', [
                'user_count' => $users->count(),
                'campus_count' => $campuses->count(),
                'complaint_type_count' => $complaintTypes->count()
            ]);

            return Inertia::render('Admin/Dashboard', [
                'users' => $users,
                'campuses' => $campuses,
                'complaintTypes' => $complaintTypes,
            ]);
        } catch (\Exception $e) {
            Log::error('Error accessing admin dashboard: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return redirect()->route('login')->withErrors([
                'email' => 'An error occurred while accessing the dashboard. Please try again.',
            ]);
        }
    }

    public function createUser(Request $request)
    {
        $defaultRole = $request->query('role', '');
        
        return Inertia::render('Admin/Users/Create', [
            'campuses' => Campus::all(),
            'complaintTypes' => ComplaintType::all(),
            'defaultRole' => $defaultRole,
        ]);
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::defaults()],
            'role' => 'required|in:coordinator,worker,vp,director',
            'campus_id' => 'required_if:role,coordinator,worker|exists:campuses,id',
            'complaint_type_id' => 'required_if:role,coordinator|exists:complaint_types,id',
        ]);

        try {
            // Log all incoming data to help debug
            Log::info('Creating user - received data:', [
                'request_data' => $request->all(),
                'validated_data' => $validated
            ]);
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $role = \App\Models\Role::where('role', $validated['role'])->firstOrFail();
            
            // Make sure campus_id is properly set
            $campus_id = isset($validated['campus_id']) ? (int)$validated['campus_id'] : null;
            $complaint_type_id = isset($validated['complaint_type_id']) ? (int)$validated['complaint_type_id'] : null;
            
            \App\Models\UserRole::create([
                'user_id' => $user->id,
                'role_id' => $role->id,
                'campus_id' => $campus_id,
                'complaint_type_id' => $complaint_type_id,
            ]);

            // Reload the user to verify the changes were saved
            $createdUser = User::with('roles')->find($user->id);
            Log::info('User created successfully - final state:', [
                'user_id' => $createdUser->id,
                'role' => $validated['role'],
                'user_campus_id' => $createdUser->roles->first()->pivot->campus_id ?? null,
                'user_complaint_type_id' => $createdUser->roles->first()->pivot->complaint_type_id ?? null
            ]);

            return redirect()->route('admin.dashboard')
                ->with('message', 'User created successfully');
        } catch (\Exception $e) {
            Log::error('Error creating user: ' . $e->getMessage(), [
                'exception' => $e,
                'data' => $validated
            ]);
            return back()->withErrors([
                'email' => 'An error occurred while creating the user. Please try again.',
            ]);
        }
    }

    public function editUser(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->load('roles'),
            'campuses' => Campus::all(),
            'complaintTypes' => ComplaintType::all(),
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:coordinator,worker,vp,director',
            'campus_id' => 'required_if:role,coordinator,worker|exists:campuses,id',
            'complaint_type_id' => 'required_if:role,coordinator|exists:complaint_types,id',
        ]);

        try {
            // Log the incoming data to debug
            Log::info('Updating user - received data:', [
                'user_id' => $user->id,
                'request_data' => $request->all(),
                'validated_data' => $validated
            ]);

            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $role = \App\Models\Role::where('role', $validated['role'])->firstOrFail();
            $userRole = $user->roles()->first();
            
            // Make sure campus_id is properly set
            $campus_id = isset($validated['campus_id']) ? (int)$validated['campus_id'] : null;
            $complaint_type_id = isset($validated['complaint_type_id']) ? (int)$validated['complaint_type_id'] : null;
            
            if ($userRole) {
                Log::info('Updating user role pivot', [
                    'user_id' => $user->id,
                    'role_id' => $role->id,
                    'campus_id' => $campus_id,
                    'complaint_type_id' => $complaint_type_id
                ]);
                
                $userRole->pivot->update([
                    'role_id' => $role->id,
                    'campus_id' => $campus_id,
                    'complaint_type_id' => $complaint_type_id,
                ]);
            }

            // Reload the user to verify the changes were saved
            $updatedUser = User::with('roles')->find($user->id);
            Log::info('User updated successfully - final state:', [
                'user_id' => $updatedUser->id,
                'user_campus_id' => $updatedUser->roles->first()->pivot->campus_id ?? null,
                'user_complaint_type_id' => $updatedUser->roles->first()->pivot->complaint_type_id ?? null
            ]);

            return redirect()->route('admin.dashboard')
                ->with('message', 'User updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating user: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
                'data' => $validated
            ]);
            return back()->withErrors([
                'email' => 'An error occurred while updating the user. Please try again.',
            ]);
        }
    }

    public function deleteUser(User $user)
    {
        try {
            $user->delete();
            Log::info('User deleted successfully', [
                'user_id' => $user->id
            ]);
            return redirect()->route('admin.dashboard')
                ->with('message', 'User deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting user: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id
            ]);
            return back()->withErrors([
                'email' => 'An error occurred while deleting the user. Please try again.',
            ]);
        }
    }
    
    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', Password::defaults()],
        ]);

        try {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);

            Log::info('User password reset successfully', [
                'user_id' => $user->id
            ]);

            return redirect()->back()
                ->with('message', 'Password reset successfully');
        } catch (\Exception $e) {
            Log::error('Error resetting user password: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id
            ]);
            return back()->withErrors([
                'password' => 'An error occurred while resetting the password. Please try again.',
            ]);
        }
    }
} 