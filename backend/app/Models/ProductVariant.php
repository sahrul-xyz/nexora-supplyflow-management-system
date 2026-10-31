<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function stock()
    {
        return $this->hasOne(InventoryStock::class)->where('warehouse_type', 'finished_goods');
    }

    public function productionOrderDetails()
    {
        return $this->hasMany(ProductionOrderDetail::class);
    }

    public function partnerOrderDetails()
    {
        return $this->hasMany(PartnerOrderDetail::class);
    }
}
