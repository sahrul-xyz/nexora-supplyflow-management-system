<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\BomDetail;
use App\Models\RawMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BomController extends Controller
{
    public function show($productId)
    {
        $product = Product::with(['bomDetails.rawMaterial.stock'])->findOrFail($productId);

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'bom_details' => $product->bomDetails,
            ],
        ]);
    }

    public function update(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'materials' => 'required|array|min:1',
            'materials.*.raw_material_id' => 'required|exists:raw_materials,id',
            'materials.*.quantity_required' => 'required|numeric|gt:0',
        ]);

        DB::transaction(function () use ($product, $request) {
            // Delete existing BOM details for this product model (BR-02: 1 model has 1 BOM)
            BomDetail::where('product_id', $product->id)->delete();

            foreach ($request->materials as $mat) {
                BomDetail::create([
                    'product_id' => $product->id,
                    'raw_material_id' => $mat['raw_material_id'],
                    'quantity_required' => $mat['quantity_required'],
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Bill of Materials (BOM) berhasil diperbarui.',
            'data' => $product->load('bomDetails.rawMaterial.stock'),
        ]);
    }
}
