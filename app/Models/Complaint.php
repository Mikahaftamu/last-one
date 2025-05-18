<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'campus_id',
        'complaint_type_id',
        'location',
        'description',
        'image_path',
        'status',
        'assigned_coordinator_id',
        'assigned_worker_id',
        'resolution_notes',
        'resolution_image',
        'resolved_at',
        'verified_at'
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'verified_at' => 'datetime'
    ];

    public function campus(): BelongsTo
    {
        return $this->belongsTo(Campus::class);
    }

    public function complaintType(): BelongsTo
    {
        return $this->belongsTo(ComplaintType::class);
    }

    public function coordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_coordinator_id');
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_worker_id');
    }
    
    public function progressUpdates(): HasMany
    {
        return $this->hasMany(ProgressUpdate::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($complaint) {
            $complaint->complaint_id = 'CMP-' . strtoupper(uniqid());
        });
    }
} 