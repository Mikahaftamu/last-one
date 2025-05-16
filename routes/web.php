<?php

use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ComplaintStatusController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth routes must be loaded first
require __DIR__.'/auth.php';

// Public routes
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

// Complaint routes (no auth required)
Route::get('/complaints/create', [ComplaintController::class, 'create'])->name('complaints.create');
Route::post('/complaints', [ComplaintController::class, 'store'])->name('complaints.store');
Route::get('/complaints/track', [ComplaintController::class, 'track'])->name('complaints.track');
Route::post('/complaints/track', [ComplaintController::class, 'trackComplaint'])->name('complaints.track.post');
Route::get('/complaints/{complaintId}', [ComplaintController::class, 'show'])->name('complaints.show');

// Admin routes
Route::middleware(['auth', \App\Http\Middleware\CheckUserRole::class.':admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/users/create', [AdminController::class, 'createUser'])->name('users.create');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
    Route::get('/users/{user}/edit', [AdminController::class, 'editUser'])->name('users.edit');
    Route::put('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->name('users.delete');
    Route::put('/users/{user}/reset-password', [AdminController::class, 'resetPassword'])->name('users.reset-password');
});

// VP routes
Route::middleware(['auth', \App\Http\Middleware\CheckUserRole::class.':vp'])->prefix('vp')->name('vp.')->group(function () {
    Route::get('/', [ComplaintController::class, 'vpDashboard'])->name('dashboard');
});

// Director routes
Route::middleware(['auth', \App\Http\Middleware\CheckUserRole::class.':director'])->prefix('director')->name('director.')->group(function () {
    Route::get('/', [ComplaintController::class, 'directorDashboard'])->name('dashboard');
});

// Coordinator routes
Route::middleware(['auth', \App\Http\Middleware\CheckUserRole::class.':coordinator'])->prefix('coordinator')->name('coordinator.')->group(function () {
    Route::get('/', [ComplaintController::class, 'coordinatorDashboard'])->name('dashboard');
});

// Worker routes
Route::middleware(['auth', \App\Http\Middleware\CheckUserRole::class.':worker'])->prefix('worker')->name('worker.')->group(function () {
    Route::get('/', [ComplaintController::class, 'workerDashboard'])->name('dashboard');
});

// Complaint Status Routes
Route::middleware(['auth'])->group(function () {
    Route::post('/complaints/{complaint}/status', [ComplaintStatusController::class, 'update'])
        ->name('complaints.update-status');
});

// Breeze profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
