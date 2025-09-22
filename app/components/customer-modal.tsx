"use client";

import { useState, useEffect } from "react";
import { Search, Plus, User, Phone, Mail, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabaseService, type Customer } from "../services/supabase-service";
import { useCart } from "../context/cart-context";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerModal({ isOpen, onClose }: CustomerModalProps) {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const { customer, setCustomer } = useCart();

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  useEffect(() => {
    let results = allCustomers;
    if (searchQuery.trim()) {
      results = allCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredCustomers(results);
  }, [searchQuery, allCustomers]);

  const loadCustomers = async () => {
    const customersFromDB = await supabaseService.getCustomers();
    setAllCustomers(customersFromDB);
    setFilteredCustomers(customersFromDB);
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) return;

    const customerData = {
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone || null,
    };

    try {
      const createdCustomer = await supabaseService.createCustomer(
        customerData as any
      );
      setNewCustomer({ name: "", email: "", phone: "" });
      setShowAddForm(false);
      loadCustomers();
      handleSelectCustomer(createdCustomer); // Langsung pilih pelanggan yang baru dibuat
    } catch (error) {
      console.error("Failed to add customer:", error);
      alert("Gagal menambahkan pelanggan. Email mungkin sudah terdaftar.");
    }
  };

  const handleSelectCustomer = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manajemen Pelanggan</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pelanggan..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pelanggan
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-4">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCustomer}>Simpan Pelanggan</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex-1 overflow-auto space-y-2">
          {customer && (
            <Card className="border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Pelanggan Saat Ini
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setCustomer(null)}>
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredCustomers.map((cust) => (
            <Card
              key={cust.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSelectCustomer(cust)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{cust.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cust.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Pelanggan tidak ditemukan
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
