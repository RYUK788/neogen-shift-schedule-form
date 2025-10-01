// Filename: SampleForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Form,
  TimePicker,
  Button as AntButton,
  Card,
  DatePicker,
  Input,
  Select,
  Row,
  Col,
  notification,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons'; // <-- Import the icon
import dayjs, { Dayjs } from 'dayjs';
import { fetchData } from '../../api';
import personnelData from './personnel.json';

const { TextArea } = Input;
const { Option } = Select;

// TypeScript interfaces for type safety
interface Personnel {
  id: string;
  name: string;
}

const disabledDate = (current: Dayjs) => {
  return current && current > dayjs().endOf('day');
};

function sqlValue(val: string | null | undefined): string {
  if (val === null || val === undefined || String(val).trim() === '') {
    return 'NULL';
  }
  const escapedVal = String(val).replace(/'/g, "''");
  return `'${escapedVal}'`;
}

function buildInsertQuery(values: any): string {
  return `
    INSERT INTO shift_schedules (
      schedule_date, supervisor, shift_lead, notes,
      shift1_start, shift1_end,
      shift2_start, shift2_end,
      shift3_start, shift3_end
    ) VALUES (
      ${sqlValue(values.date)},
      ${sqlValue(values.supervisor)},
      ${sqlValue(values.shiftLead)},
      ${sqlValue(values.notes)},
      ${sqlValue(values.shift1.start)},
      ${sqlValue(values.shift1.end)},
      ${sqlValue(values.shift2.start)},
      ${sqlValue(values.shift2.end)},
      ${sqlValue(values.shift3.start)},
      ${sqlValue(values.shift3.end)}
    );
  `;
}

interface SampleFormProps {
  closeForm?: () => void;
}

const SampleForm: React.FC<SampleFormProps> = props => {
  const [form] = Form.useForm();
  const [supervisors, setSupervisors] = useState<Personnel[]>([]);
  const [shiftLeads, setShiftLeads] = useState<Personnel[]>([]);

  useEffect(() => {
    setSupervisors(personnelData.supervisors);
    setShiftLeads(personnelData.shiftLeads);
  }, []);

  const [initialFormValues] = useState({
    date: dayjs(),
  });

  const openNotification = (type: 'success' | 'info', message: string) => {
    notification[type]({ message, placement: 'bottomRight' });
  };

  const onSubmitForm = async (values: any) => {
    try {
      const formattedValues = {
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
        supervisor: values.supervisor,
        shiftLead: values.shiftLead,
        notes: values.notes,
        shift1: {
          start: values.shift1 ? values.shift1[0].format('HH:mm') : null,
          end: values.shift1 ? values.shift1[1].format('HH:mm') : null,
        },
        shift2: {
          start: values.shift2 ? values.shift2[0].format('HH:mm') : null,
          end: values.shift2 ? values.shift2[1].format('HH:mm') : null,
        },
        shift3: {
          start: values.shift3 ? values.shift3[0].format('HH:mm') : null,
          end: values.shift3 ? values.shift3[1].format('HH:mm') : null,
        },
      };

      const sqlQuery = buildInsertQuery(formattedValues);
      await fetchData(sqlQuery);

      openNotification('success', 'Shift schedule submitted successfully!');
      form.resetFields();
    } catch (error: any) {
      console.error('Submission Failed:', error);
      const errorMessage = error.message || 'An unknown server error occurred.';
      notification.error({
        message: 'Submission Failed',
        description: `Could not save the schedule. Server responded with: ${errorMessage}`,
        placement: 'bottomRight',
      });
    }
  };
  
  // The "New" button clears the form and shows a notification
  const newForm = () => {
    form.resetFields();
    openNotification('info', 'Form has been reset');
  };

  const handleClose = () => {
    if (props.closeForm) {
      props.closeForm();
    } else {
      console.log('Close button clicked. (No closeForm prop was provided)');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px',
      }}
    >
      <Card
        title="Shift Schedule Form"
        bordered={false}
        style={{ width: '100%', maxWidth: 800, padding: '20px' }}
      >
        <Form
          form={form}
          name="shift_schedule_form"
          layout="vertical"
          onFinish={onSubmitForm}
          autoComplete="off"
          initialValues={initialFormValues}
        >
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date.' }]}
              >
                <DatePicker style={{ width: '100%' }} disabledDate={disabledDate} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="supervisor"
                label="Supervisor"
                rules={[{ required: true, message: 'Please select a supervisor.' }]}
              >
                <Select placeholder="Select a supervisor">
                  {supervisors.map(s => (
                    <Option key={s.id} value={s.name}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="shiftLead"
                label="Shift Lead"
                rules={[{ required: true, message: "Please select a shift lead." }]}
              >
                <Select placeholder="Select a shift lead">
                    {shiftLeads.map(lead => (
                        <Option key={lead.id} value={lead.name}>
                            {lead.name}
                        </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              {/* This column is intentionally left blank for alignment */}
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="shift1"
                label="Shift 1: Start & End Time"
                rules={[{ required: true, message: 'Please select time for Shift 1.' }]}
              >
                <TimePicker.RangePicker style={{ width: '100%' }} format="h:mm A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="shift2"
                label="Shift 2: Start & End Time"
                rules={[{ required: true, message: 'Please select time for Shift 2.' }]}
              >
                <TimePicker.RangePicker style={{ width: '100%' }} format="h:mm A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="shift3"
                label="Shift 3: Start & End Time"
                rules={[{ required: true, message: 'Please select time for Shift 3.' }]}
              >
                <TimePicker.RangePicker style={{ width: '100%' }} format="h:mm A" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="notes" label="Notes">
                <TextArea rows={3} placeholder="Add any relevant notes here..." />
              </Form.Item>
            </Col>
          </Row>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '24px',
            }}
          >
            <AntButton
              type="default"
              size="large"
              onClick={newForm}
              style={{ backgroundColor: '#454E7C', color: 'white' }}
            >
              New
            </AntButton>
            <div>
              {/* Reset button with icon added here */}
              <AntButton
                type="default"
                size="large"
                icon={<ReloadOutlined />}
                style={{
                  marginRight: 8,
                  backgroundColor: '#454E7C',
                  color: 'white',
                }}
                onClick={() => form.resetFields()}
              />
              <AntButton
                type="default"
                size="large"
                style={{
                  marginRight: 8,
                  backgroundColor: '#454E7C',
                  color: 'white',
                }}
                onClick={handleClose}
              >
                Close
              </AntButton>
              <AntButton
                type="primary"
                htmlType="submit"
                size="large"
                style={{ backgroundColor: '#454E7C', borderColor: '#454E7C' }}
              >
                Save Schedule
              </AntButton>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SampleForm;