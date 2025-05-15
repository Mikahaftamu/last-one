<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campus extends Model
{
    protected $fillable = ['name', 'code'];

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }

    public function coordinators()
    {
        return $this->hasMany(User::class, 'user_roles')
            ->whereHas('roles', function ($query) {
                $query->where('role', 'coordinator');
            });
    }

    public function workers()
    {
        return $this->hasMany(User::class, 'user_roles')
            ->whereHas('roles', function ($query) {
                $query->where('role', 'worker');
            });
    }
} 