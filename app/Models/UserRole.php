<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRole extends Model
{
    protected $fillable = [
        'user_id',
        'role_id',
        'campus_id',
        'complaint_type_id',
    ];

    /**
     * Get the user that owns the role.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function campus(): BelongsTo
    {
        return $this->belongsTo(Campus::class);
    }

    public function complaintType(): BelongsTo
    {
        return $this->belongsTo(ComplaintType::class);
    }
} 