<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_code',
        'material_name',
        'unit',
        'minimum_stock',
        'is_active',
    ];

    protected $casts = [
        'minimum_stock' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function bomDetails()
    {
        return $this->hasMany(BomDetail::class);
    }

    public function purchaseOrderDetails()
    {
        return $this->hasMany(PurchaseOrderDetail::class);
    }

    public function stock()
    {
        return $this->hasOne(InventoryStock::class)->where('warehouse_type', 'raw_material');
    }
}
