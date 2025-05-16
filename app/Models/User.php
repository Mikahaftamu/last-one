<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function assignedComplaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'assigned_coordinator_id');
    }

    public function workerComplaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'assigned_worker_id');
    }

    public function hasRole(string $role): bool
    {
        return $this->roles()->where('roles.role', $role)->exists();
    }

    public function isCoordinator(): bool
    {
        return $this->hasRole('coordinator');
    }

    public function isWorker(): bool
    {
        return $this->hasRole('worker');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isVP(): bool
    {
        return $this->hasRole('vp');
    }

    public function isDirector(): bool
    {
        return $this->hasRole('director');
    }
}
