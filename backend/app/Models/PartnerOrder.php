<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'partner_id',
        'created_by',
        'order_date',
        'status',
        'shipping_address',
        'tracking_number',
        'shipped_at',
        'delivered_at',
        'notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details()
    {
        return $this->hasMany(PartnerOrderDetail::class);
    }
}
