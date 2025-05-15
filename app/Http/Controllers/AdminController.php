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

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:admin']);
    }

    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'users' => User::with('roles')->get(),
            'campuses' => Campus::all(),
            'complaintTypes' => ComplaintType::all(),
        ]);
    }

    public function createUser()
    {
        return Inertia::render('Admin/Users/Create', [
            'campuses' => Campus::all(),
            'complaintTypes' => ComplaintType::all(),
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

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        UserRole::create([
            'user_id' => $user->id,
            'role' => $validated['role'],
            'campus_id' => $validated['campus_id'] ?? null,
            'complaint_type_id' => $validated['complaint_type_id'] ?? null,
        ]);

        return redirect()->route('admin.dashboard')
            ->with('message', 'User created successfully');
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

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        $user->roles()->update([
            'role' => $validated['role'],
            'campus_id' => $validated['campus_id'] ?? null,
            'complaint_type_id' => $validated['complaint_type_id'] ?? null,
        ]);

        return redirect()->route('admin.dashboard')
            ->with('message', 'User updated successfully');
    }

    public function deleteUser(User $user)
    {
        $user->delete();
        return redirect()->route('admin.dashboard')
            ->with('message', 'User deleted successfully');
    }
} 