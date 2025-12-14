import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Search } from "lucide-react"

export default function POSPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-4 md:flex-row">
            {/* Product Section */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="pl-8"
                        />
                    </div>
                    <Tabs defaultValue="all" className="w-auto">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="food">Food</TabsTrigger>
                            <TabsTrigger value="drinks">Drinks</TabsTrigger>
                            <TabsTrigger value="desserts">Desserts</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <ScrollArea className="flex-1 rounded-md border p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Mock Products */}
                        {Array.from({ length: 12 }).map((_, i) => (
                            <Card key={i} className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors overflow-hidden">
                                <div className="aspect-square bg-muted w-full relative">
                                    {/* Image placeholder */}
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        Product {i + 1}
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="font-semibold truncate">Pad Thai with Shrimp</div>
                                    <div className="text-sm text-muted-foreground">฿120.00</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Cart Section */}
            <Card className="w-full md:w-[400px] flex flex-col shadow-lg border-l">
                <CardHeader>
                    <CardTitle>Current Order</CardTitle>
                    <CardDescription>Order #1024</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[400px] md:h-full">
                        <div className="p-4 flex flex-col gap-4">
                            {/* Mock Cart Items */}
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center text-xs">x1</div>
                                        <div>
                                            <div className="font-medium">Pad Thai</div>
                                            <div className="text-sm text-muted-foreground">No Peanuts</div>
                                        </div>
                                    </div>
                                    <div className="font-medium">฿120</div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
                <Separator />
                <CardFooter className="flex-col gap-4 p-6 bg-muted/20">
                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>฿360.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (7%)</span>
                            <span>฿25.20</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2">
                            <span>Total</span>
                            <span>฿385.20</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Button variant="outline" className="w-full">Hold</Button>
                        <Button variant="destructive" className="w-full">Clear</Button>
                        <Button className="w-full col-span-2 size-lg text-lg">Pay ฿385.20</Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
