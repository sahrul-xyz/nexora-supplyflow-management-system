<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PartnerController extends Controller
{
    public function index(Request $request)
    {
        $query = Partner::withCount('orders');

        if ($request->filled('type')) {
            $query->where('partner_type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('partner_name', 'like', "%{$search}%")
                  ->orWhere('partner_code', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        $partners = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $partners,
        ]);
    }

    public function show($id)
    {
        $partner = Partner::with(['orders.details.productVariant.product'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $partner,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'partner_code' => 'required|string|max:30|unique:partners,partner_code',
            'partner_name' => 'required|string|max:150',
            'partner_type' => ['required', Rule::in(['reseller', 'distributor'])],
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
        ]);

        $partner = Partner::create(array_merge($validated, ['is_active' => true]));

        return response()->json([
            'success' => true,
            'message' => 'Data mitra berhasil ditambahkan.',
            'data' => $partner,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $partner = Partner::findOrFail($id);

        $validated = $request->validate([
            'partner_code' => ['required', 'string', 'max:30', Rule::unique('partners')->ignore($partner->id)],
            'partner_name' => 'required|string|max:150',
            'partner_type' => ['required', Rule::in(['reseller', 'distributor'])],
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $partner->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data mitra berhasil diperbarui.',
            'data' => $partner,
        ]);
    }

    public function destroy($id)
    {
        $partner = Partner::findOrFail($id);
        $partner->is_active = !$partner->is_active;
        $partner->save();

        $statusText = $partner->is_active ? 'diaktifkan kembali' : 'dinonaktifkan';

        return response()->json([
            'success' => true,
            'message' => "Mitra berhasil {$statusText}.",
            'data' => $partner,
        ]);
    }
}
