<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionOrderDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_order_id',
        'product_variant_id',
        'target_quantity',
        'actual_quantity',
        'passed_quantity',
        'rejected_quantity',
        'qc_checked_by',
        'qc_checked_at',
    ];

    protected $casts = [
        'target_quantity' => 'integer',
        'actual_quantity' => 'integer',
        'passed_quantity' => 'integer',
        'rejected_quantity' => 'integer',
        'qc_checked_at' => 'datetime',
    ];

    public function productionOrder()
    {
        return $this->belongsTo(ProductionOrder::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function qcChecker()
    {
        return $this->belongsTo(User::class, 'qc_checked_by');
    }
}
