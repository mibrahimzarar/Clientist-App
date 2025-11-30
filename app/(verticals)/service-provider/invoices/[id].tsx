import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSPInvoice, useUpdateSPInvoice, useDeleteSPInvoice } from '../../../../src/hooks/useServiceProvider'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { SPInvoiceStatus } from '../../../../src/types/serviceProvider'
import { printToFileAsync } from 'expo-print'
import { shareAsync } from 'expo-sharing'
import { supabase } from '../../../../src/lib/supabase'

export default function InvoiceDetailsPage() {
    const { id } = useLocalSearchParams()
    const invoiceId = id as string

    const { data: invoiceData, isLoading } = useSPInvoice(invoiceId)
    const updateInvoiceMutation = useUpdateSPInvoice()
    const deleteInvoiceMutation = useDeleteSPInvoice()
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    const invoice = invoiceData?.data

    const handleStatusChange = async (newStatus: SPInvoiceStatus) => {
        if (!invoice) return

        await updateInvoiceMutation.mutateAsync({
            id: invoice.id,
            updates: { status: newStatus },
        })

        Alert.alert('Success', 'Invoice status updated')
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Invoice',
            'Are you sure you want to delete this invoice? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteInvoiceMutation.mutateAsync(invoiceId)
                        router.back()
                    },
                },
            ]
        )
    }

    const generatePdf = async () => {
        if (!invoice) return

        try {
            setIsGeneratingPdf(true)

            // Fetch company profile for logo and name
            const { data: { user } } = await supabase.auth.getUser()
            let companyLogo = null
            let companyName = 'Service Provider'

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('company_logo, full_name, company_name')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    companyLogo = profile.company_logo
                    companyName = profile.company_name || profile.full_name || 'Service Provider'
                }
            }

            const html = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                            }
                            body {
                                padding: 20px;
                                color: #333;
                                background: #fff;
                                font-size: 12px;
                                line-height: 1.4;
                            }
                            .invoice-container {
                                max-width: 100%;
                                margin: 0 auto;
                            }
                            .header {
                                display: flex;
                                justify-content: space-between;
                                padding: 20px;
                                background: linear-gradient(135deg, #059669 0%, #10B981 100%);
                                color: white;
                                border-radius: 8px;
                                margin-bottom: 30px;
                            }
                            .logo-container {
                                display: flex;
                                align-items: center;
                            }
                            .logo {
                                width: 60px;
                                height: 60px;
                                border-radius: 10px;
                                margin-right: 15px;
                                object-fit: cover;
                                border: 2px solid rgba(255,255,255,0.3);
                            }
                            .company-name {
                                font-size: 24px;
                                font-weight: 700;
                                margin-bottom: 4px;
                            }
                            .company-tagline {
                                font-size: 12px;
                                opacity: 0.9;
                            }
                            .invoice-title {
                                text-align: right;
                            }
                            .invoice-title h1 {
                                font-size: 32px;
                                font-weight: 700;
                                margin-bottom: 8px;
                            }
                            .invoice-number {
                                font-size: 14px;
                                opacity: 0.95;
                            }
                            .invoice-info {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 30px;
                                padding: 20px;
                                background: #F9FAFB;
                                border-radius: 8px;
                            }
                            .info-section {
                                flex: 1;
                            }
                            .info-title {
                                font-size: 10px;
                                color: #6B7280;
                                text-transform: uppercase;
                                margin-bottom: 8px;
                                font-weight: 600;
                            }
                            .client-name {
                                font-size: 16px;
                                font-weight: 600;
                                color: #111827;
                                margin-bottom: 4px;
                            }
                            .client-contact {
                                font-size: 12px;
                                color: #6B7280;
                                margin-top: 2px;
                            }
                            .status-badge {
                                display: inline-block;
                                padding: 6px 12px;
                                border-radius: 6px;
                                font-size: 11px;
                                font-weight: 600;
                                text-transform: uppercase;
                                ${invoice.status === 'paid' ? 'background: #D1FAE5; color: #059669;' : ''}
                                ${invoice.status === 'unpaid' ? 'background: #FEF3C7; color: #D97706;' : ''}
                                ${invoice.status === 'partially_paid' ? 'background: #DBEAFE; color: #2563EB;' : ''}
                                ${invoice.status === 'overdue' ? 'background: #FEF2F2; color: #DC2626;' : ''}
                                ${invoice.status === 'cancelled' ? 'background: #F3F4F6; color: #6B7280;' : ''}
                            }
                            .section {
                                margin-bottom: 30px;
                            }
                            .section-title {
                                font-size: 14px;
                                font-weight: 700;
                                color: #111827;
                                margin-bottom: 16px;
                                text-transform: uppercase;
                            }
                            .table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 20px;
                            }
                            .table thead {
                                background: #F9FAFB;
                            }
                            .table th {
                                padding: 12px;
                                text-align: left;
                                font-size: 11px;
                                font-weight: 600;
                                color: #6B7280;
                                text-transform: uppercase;
                                border-bottom: 2px solid #E5E7EB;
                            }
                            .table td {
                                padding: 12px;
                                font-size: 12px;
                                color: #374151;
                                border-bottom: 1px solid #F3F4F6;
                            }
                            .description-col {
                                width: 100%;
                            }
                            .summary-table {
                                width: 300px;
                                margin-left: auto;
                                margin-top: 20px;
                            }
                            .summary-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid #E5E7EB;
                            }
                            .summary-label {
                                font-size: 12px;
                                color: #6B7280;
                            }
                            .summary-value {
                                font-size: 12px;
                                font-weight: 600;
                                color: #111827;
                            }
                            .total-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 16px 0;
                                margin-top: 8px;
                                border-top: 2px solid #10B981;
                            }
                            .total-label {
                                font-size: 16px;
                                font-weight: 700;
                                color: #111827;
                            }
                            .total-value {
                                font-size: 20px;
                                font-weight: 700;
                                color: #10B981;
                            }
                            .notes {
                                padding: 16px;
                                background: #F9FAFB;
                                border-radius: 8px;
                                margin-top: 20px;
                            }
                            .notes-title {
                                font-size: 12px;
                                font-weight: 600;
                                color: #6B7280;
                                margin-bottom: 8px;
                                text-transform: uppercase;
                            }
                            .notes-content {
                                font-size: 12px;
                                color: #4B5563;
                                line-height: 1.6;
                            }
                            .footer {
                                margin-top: 40px;
                                padding-top: 20px;
                                border-top: 1px solid #E5E7EB;
                                text-align: center;
                                font-size: 11px;
                                color: #9CA3AF;
                            }
                            @page {
                                size: A4;
                                margin: 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="invoice-container">
                            <div class="header">
                                <div class="logo-container">
                                    ${companyLogo ? `<img src="${companyLogo}" class="logo" />` : ''}
                                    <div>
                                        <div class="company-name">${companyName}</div>
                                        <div class="company-tagline">Professional Services</div>
                                    </div>
                                </div>
                                <div class="invoice-title">
                                    <h1>INVOICE</h1>
                                    <div class="invoice-number">#${invoice.invoice_number}</div>
                                </div>
                            </div>
                            
                            <div class="invoice-info">
                                <div class="info-section">
                                    <div class="info-title">Invoice Date</div>
                                    <div>${new Date(invoice.invoice_date).toLocaleDateString()}</div>
                                    ${invoice.due_date ? `
                                        <div style="margin-top: 12px;">
                                            <div class="info-title">Due Date</div>
                                            <div>${new Date(invoice.due_date).toLocaleDateString()}</div>
                                        </div>
                                    ` : ''}
                                    <div style="margin-top: 12px;">
                                        <span class="status-badge">${invoice.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div class="info-section" style="text-align: right;">
                                    <div class="info-title">Bill To</div>
                                    <div class="client-name">${invoice.client?.full_name}</div>
                                    ${invoice.client?.phone_number ? `<div class="client-contact">${invoice.client.phone_number}</div>` : ''}
                                    ${invoice.client?.address ? `<div class="client-contact">${invoice.client.address}</div>` : ''}
                                </div>
                            </div>
                            
                            <div class="section">
                                <div class="section-title">Tasks</div>
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th style="text-align: right;">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${invoice.items?.map(task => `
                                            <tr>
                                                <td class="description-col">${task.description}</td>
                                                <td style="text-align: right;">₨${task.amount.toLocaleString()}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                
                                <div class="summary-table">
                                    <div class="summary-row">
                                        <div class="summary-label">Subtotal</div>
                                        <div class="summary-value">₨${invoice.subtotal.toLocaleString()}</div>
                                    </div>
                                    ${invoice.tax_amount > 0 ? `
                                        <div class="summary-row">
                                            <div class="summary-label">Tax</div>
                                            <div class="summary-value">₨${invoice.tax_amount.toLocaleString()}</div>
                                        </div>
                                    ` : ''}
                                    ${invoice.discount_amount > 0 ? `
                                        <div class="summary-row">
                                            <div class="summary-label">Discount</div>
                                            <div class="summary-value" style="color: #EF4444;">-₨${invoice.discount_amount.toLocaleString()}</div>
                                        </div>
                                    ` : ''}
                                    <div class="total-row">
                                        <div class="total-label">Total</div>
                                        <div class="total-value">₨${invoice.total_amount.toLocaleString()}</div>
                                    </div>
                                    ${invoice.amount_paid > 0 ? `
                                        <div class="summary-row">
                                            <div class="summary-label">Amount Paid</div>
                                            <div class="summary-value" style="color: #10B981;">₨${invoice.amount_paid.toLocaleString()}</div>
                                        </div>
                                        <div class="summary-row">
                                            <div class="summary-label">Amount Due</div>
                                            <div class="summary-value" style="color: #EF4444; font-weight: 700;">₨${(invoice.total_amount - invoice.amount_paid).toLocaleString()}</div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            
                            ${invoice.notes ? `
                                <div class="section">
                                    <div class="notes">
                                        <div class="notes-title">Notes</div>
                                        <div class="notes-content">${invoice.notes}</div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="footer">
                                Thank you for your business!
                            </div>
                        </div>
                    </body>
                </html>
            `

            const { uri } = await printToFileAsync({
                html,
                base64: false
            })

            // Generate filename
            const clientName = invoice.client?.full_name?.replace(/\s+/g, '_') || 'client'
            const fileName = `${clientName}_Invoice_${invoice.invoice_number}.pdf`

            await shareAsync(uri, { 
                UTI: '.pdf', 
                mimeType: 'application/pdf',
                dialogTitle: `Share ${fileName}`
            })

        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF')
            console.error(error)
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    const getStatusColor = (status: SPInvoiceStatus) => {
        switch (status) {
            case 'unpaid': return '#F59E0B'
            case 'paid': return '#10B981'
            case 'partially_paid': return '#3B82F6'
            case 'overdue': return '#EF4444'
            case 'cancelled': return '#6B7280'
            default: return '#6B7280'
        }
    }

    const getStatusIcon = (status: SPInvoiceStatus) => {
        switch (status) {
            case 'unpaid': return 'time'
            case 'paid': return 'checkmark-circle'
            case 'partially_paid': return 'pie-chart'
            case 'overdue': return 'alert-circle'
            case 'cancelled': return 'close-circle'
            default: return 'ellipse'
        }
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#10B981" />
            </View>
        )
    }

    if (!invoice) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
                <Text style={styles.errorText}>Invoice not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonError}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>#{invoice.invoice_number}</Text>
                        <Text style={styles.headerSubtitle}>Invoice Details</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            onPress={() => router.push(`/(verticals)/service-provider/invoices/${invoiceId}/edit` as any)} 
                            style={styles.editButton}
                        >
                            <Ionicons name="create-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Status Card */}
                <View style={styles.card}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                        <Ionicons name={getStatusIcon(invoice.status)} size={16} color="#fff" />
                        <Text style={styles.statusBadgeText}>{invoice.status.replace('_', ' ')}</Text>
                    </View>

                    <View style={styles.invoiceHeader}>
                        <Text style={styles.invoiceNumber}>Invoice #{invoice.invoice_number}</Text>
                        <Text style={styles.invoiceDate}>
                            Issued: {new Date(invoice.invoice_date).toLocaleDateString()}
                        </Text>
                        {invoice.due_date && (
                            <Text style={styles.invoiceDate}>
                                Due: {new Date(invoice.due_date).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Client Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Client Information</Text>
                    <View style={styles.clientInfo}>
                        <View style={styles.clientAvatar}>
                            <Text style={styles.clientAvatarText}>
                                {invoice.client?.full_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.clientDetails}>
                            <Text style={styles.clientName}>{invoice.client?.full_name}</Text>
                            {invoice.client?.phone_number && (
                                <Text style={styles.clientContact}>{invoice.client.phone_number}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* PDF Download Button */}
                <TouchableOpacity
                    style={styles.pdfButton}
                    onPress={generatePdf}
                    disabled={isGeneratingPdf}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.pdfButtonGradient}
                    >
                        {isGeneratingPdf ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="download-outline" size={20} color="#fff" />
                                <Text style={styles.pdfButtonText}>Download PDF</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Tasks */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tasks</Text>
                    {invoice.items?.map((item, index) => (
                        <View key={item.id} style={[
                            styles.taskRow,
                            index === invoice.items!.length - 1 && styles.taskRowLast
                        ]}>
                            <View style={styles.taskInfo}>
                                <Text style={styles.taskDescription}>{item.description}</Text>
                            </View>
                            <Text style={styles.taskAmount}>₨{item.amount.toLocaleString()}</Text>
                        </View>
                    ))}
                </View>

                {/* Amount Breakdown */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Amount Breakdown</Text>

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Subtotal</Text>
                        <Text style={styles.amountValue}>₨{invoice.subtotal.toLocaleString()}</Text>
                    </View>

                    {invoice.tax_amount > 0 && (
                        <View style={styles.amountRow}>
                            <Text style={styles.amountLabel}>Tax</Text>
                            <Text style={styles.amountValue}>₨{invoice.tax_amount.toLocaleString()}</Text>
                        </View>
                    )}

                    {invoice.discount_amount > 0 && (
                        <View style={styles.amountRow}>
                            <Text style={styles.amountLabel}>Discount</Text>
                            <Text style={[styles.amountValue, { color: '#EF4444' }]}>
                                -₨{invoice.discount_amount.toLocaleString()}
                            </Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.amountRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₨{invoice.total_amount.toLocaleString()}</Text>
                    </View>

                    {invoice.amount_paid > 0 && (
                        <>
                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabel}>Amount Paid</Text>
                                <Text style={[styles.amountValue, { color: '#10B981' }]}>
                                    ₨{invoice.amount_paid.toLocaleString()}
                                </Text>
                            </View>
                            <View style={styles.amountRow}>
                                <Text style={styles.dueLabel}>Amount Due</Text>
                                <Text style={styles.dueValue}>
                                    ₨{(invoice.total_amount - invoice.amount_paid).toLocaleString()}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Notes</Text>
                        <Text style={styles.notesText}>{invoice.notes}</Text>
                    </View>
                )}

                {/* Change Status */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Change Status</Text>
                    <View style={styles.statusButtons}>
                        {(['unpaid', 'paid', 'partially_paid', 'overdue', 'cancelled'] as SPInvoiceStatus[]).map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusButton,
                                    invoice.status === status && { backgroundColor: getStatusColor(status) }
                                ]}
                                onPress={() => handleStatusChange(status)}
                                disabled={invoice.status === status}
                            >
                                <Ionicons
                                    name={getStatusIcon(status)}
                                    size={16}
                                    color={invoice.status === status ? '#fff' : getStatusColor(status)}
                                />
                                <Text style={[
                                    styles.statusButtonText,
                                    invoice.status === status && { color: '#fff' }
                                ]}>
                                    {status.replace('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Timestamps */}
                <View style={styles.timestampContainer}>
                    <Text style={styles.timestamp}>
                        Created: {new Date(invoice.created_at).toLocaleString()}
                    </Text>
                    <Text style={styles.timestamp}>
                        Updated: {new Date(invoice.updated_at).toLocaleString()}
                    </Text>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 24,
    },
    backButtonError: {
        backgroundColor: '#10B981',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    headerContent: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 10,
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 12,
        padding: 10,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 16,
        gap: 6,
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    invoiceHeader: {
        gap: 4,
    },
    invoiceNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    invoiceDate: {
        fontSize: 14,
        color: '#6B7280',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clientAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    clientAvatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    clientDetails: {
        flex: 1,
    },
    clientName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    clientContact: {
        fontSize: 14,
        color: '#6B7280',
    },
    taskRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    taskRowLast: {
        borderBottomWidth: 0,
    },
    taskInfo: {
        flex: 1,
        marginRight: 16,
    },
    taskDescription: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
        lineHeight: 22,
    },
    taskAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10B981',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    amountLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    amountValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#10B981',
    },
    dueLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#EF4444',
    },
    dueValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#EF4444',
    },
    notesText: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 6,
    },
    statusButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    timestampContainer: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
        marginVertical: 2,
    },
    pdfButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    pdfButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    pdfButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
})
