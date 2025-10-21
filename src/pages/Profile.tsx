import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/hooks/useStore";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface OrderItem {
  itemId: number;
  productName: string;
  quantity: number;
  price: number;
  itemTotal: number;
  personalizationDetails?: any;
}

interface Order {
  orderId: number;
  orderDate: string;
  status: string;
  totalPrice: number;
  deliveryAddress: string;
  contactNumber: string;
  orderItems: OrderItem[];
}

const Profile = () => {
  const { currentUser, userInfo, logout } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser || currentUser !== "customer") {
      navigate("/auth");
      return;
    }

    loadOrders();
  }, [currentUser, navigate]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        "http://localhost:8081/api/orders/my-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast({
        title: "Error",
        description: "Failed to load order history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <Package className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "confirmed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 sm:mb-6 -ml-2 sm:-ml-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your account and view your order history
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {/* Account Information Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{userInfo?.username || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {userInfo?.email || "N/A"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <Badge variant="outline" className="mt-1">
                    {currentUser === "customer" ? "Customer" : currentUser}
                  </Badge>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Order Summary Card */}
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Orders
                    </span>
                    <span className="font-semibold">{orders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Pending
                    </span>
                    <span className="font-semibold">
                      {
                        orders.filter(
                          (o) => o.status.toLowerCase() === "pending"
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Delivered
                    </span>
                    <span className="font-semibold">
                      {
                        orders.filter(
                          (o) => o.status.toLowerCase() === "delivered"
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No orders yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start shopping to see your orders here
                    </p>
                    <Button asChild>
                      <Link to="/products">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.orderId}
                        className="border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                      >
                        {/* Order Header */}
                        <div
                          className="p-3 sm:p-4 bg-muted/50 cursor-pointer"
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order.orderId
                                ? null
                                : order.orderId
                            )
                          }
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-sm sm:text-base">
                                  Order #{order.orderId}
                                </span>
                                <Badge
                                  variant={getStatusVariant(order.status)}
                                  className="text-xs"
                                >
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(order.status)}
                                    <span className="hidden sm:inline">
                                      {order.status}
                                    </span>
                                  </span>
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {new Date(order.orderDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {order.orderItems?.length || 0} item(s)
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-base sm:text-lg font-bold">
                                Rs {order.totalPrice.toFixed(2)}
                              </p>
                              <ChevronRight
                                className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform ${
                                  expandedOrderId === order.orderId
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Order Details (Expandable) */}
                        {expandedOrderId === order.orderId && (
                          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                                Order Items
                              </h4>
                              <div className="space-y-2">
                                {order.orderItems?.map((item) => (
                                  <div
                                    key={item.itemId}
                                    className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-2 sm:p-3 bg-muted/30 rounded"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm sm:text-base truncate">
                                        {item.productName}
                                      </p>
                                      <p className="text-xs sm:text-sm text-muted-foreground">
                                        Quantity: {item.quantity} × Rs
                                        {item.price.toFixed(2)}
                                      </p>
                                      {item.personalizationDetails && (
                                        <Badge
                                          variant="outline"
                                          className="mt-1 text-xs"
                                        >
                                          Personalized
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="font-semibold text-sm sm:text-base self-end sm:self-center">
                                      Rs {item.itemTotal.toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            {/* Delivery Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                                  Delivery Address
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                                  {order.deliveryAddress}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                                  Contact Number
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {order.contactNumber}
                                </p>
                              </div>
                            </div>

                            <Separator />

                            {/* Order Total */}
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-semibold text-sm sm:text-base">
                                Total Amount
                              </span>
                              <span className="text-lg sm:text-xl font-bold">
                                Rs {order.totalPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
